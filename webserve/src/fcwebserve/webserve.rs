use iron::prelude::*;
use iron::status;
use iron::Url;
use std::path::Path;
use staticfile::Static;
use mount::Mount;
use fccore::Core;
use std::thread;
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use hyper::header::AccessControlAllowOrigin;
use fcwebserve::config::Config;
use fcwebserve::core_config::get_config;
use fcwebserve::status::status_report;
use fcwebserve::arming::*;
use fcwebserve::wlog::*;

const TAG : &'static str = "webserve";

fn unknown(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().log_mut().add(TAG, "Unhandled REST request");
    Response::with((status::NotFound, "unknown command"))
}

fn turn_on(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_on(true);
    Response::with((status::Ok, "ok"))
}

fn turn_off(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_on(false);
    Response::with((status::Ok, "ok"))
}

fn white(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_color_all(255, 255, 255);
    Response::with((status::Ok, "ok"))
}

fn red(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_color_all(255, 0, 0);
    Response::with((status::Ok, "ok"))
}

fn green(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_color_all(0, 255, 0);
    Response::with((status::Ok, "ok"))
}

fn blue(core_ref : &Arc<Mutex<Core>>) -> Response {
    core_ref.lock().unwrap().set_color_all(0,0,255);
    Response::with((status::Ok, "ok"))
}

fn brightness(core_ref : &Arc<Mutex<Core>>, req: &Request) -> Response {
    core_ref.lock().unwrap().set_brightness(find_color("brightness", &req.url));
    Response::with((status::Ok, "ok"))
}

fn find(name: &str, url: &Url) -> Option<String> {
    let pairs = url.clone().into_generic_url().query_pairs();

    if pairs.is_some() {
        match pairs.unwrap().iter().find(|&&(ref pname, _)| name == pname) {
            Some(&(_, ref val)) => Some(val.to_string()),
            _ => None
        }
    } else {
        None
    }
}

//Find color from query string or return 0
fn find_color(name: &str, url: &Url) -> usize {
    match find(name, url) {
        Some(val) => usize::from_str(&val).unwrap_or(0),
        _ => 0
    }
}

fn color(core_ref: &Arc<Mutex<Core>>, req: &Request) -> Response {
    core_ref.lock().unwrap().set_color_all(find_color("r", &req.url), find_color("g", &req.url), find_color("b", &req.url));
    Response::with((status::Ok, "ok"))
}

fn page_handler(req : &mut Request, core : &Arc<Mutex<Core>>) -> IronResult<Response> {    	
  
    //let full_req_path = req.url.path.iter().fold(String::new(), |curr, next| curr + "/" + next);
    
    let response = if req.url.path.len() != 0 {
        let base_cmd : &str = &req.url.path[0].clone();

        let mut response = match base_cmd {
         "log" => get_log(core),
         "log_reduced" => get_log_min(core),
         "kill" => kill_core(core),
         "config" => get_config(core),
         "on" => turn_on(core),
         "off" => turn_off(core),
         "white" => white(core),
         "red" => red(core),
         "green" => green(core),
         "blue" => blue(core),
         "color" => color(core, req),
         "brightness" => brightness(core, req),
         "status" | _ => status_report(core),
        };

        response.headers.set(AccessControlAllowOrigin::Any);
        response
    } else {
        unknown(core)
    };

    Ok(response)
}

fn start_webserve_thread(core : Arc<Mutex<Core>>, config: &Config) {
    let webserve_addr = config.api_address.clone();
    let static_addr = config.static_address.clone();
    let static_dir = config.static_dir.clone();
    let alt_core = core.clone();

    //Launch the REST server
    thread::spawn(move || {
        core.lock().unwrap().log_mut().add(TAG, &format!("Starting webserve on {}", webserve_addr));
        Iron::new(move |req: &mut Request| {
            page_handler(req, &core)
        }).http(&webserve_addr as &str).unwrap();
    });

    //Launch the static file server
    thread::spawn(move || {
        alt_core.lock().unwrap().log_mut().add(TAG, &format!("Starting static serve on {} files at {}", &static_addr, &static_dir));
        let mut mount = Mount::new();
        mount.mount("/", Static::new(Path::new(&static_dir)));
        Iron::new(mount).http(&static_addr as &str).unwrap();
    });
}

pub fn spawn(core : &Arc<Mutex<Core>>, config_path: &str) {
    let webserve_config = Config::load(config_path);

    if webserve_config.enabled {
        start_webserve_thread(core.clone(), &webserve_config);
    } else {
        core.lock().unwrap().log_mut().add(TAG, "Webserve disabled by configuration file");
    }
}
