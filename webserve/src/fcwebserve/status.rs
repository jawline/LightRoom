use rustc_serialize::json;
use std::string::{String, ToString};
use fccore::Core;
use std::sync::MutexGuard;
use iron::prelude::*;
use std::sync::{Arc, Mutex};
use iron::status;
use iron::mime::Mime;

#[derive(RustcEncodable)]
struct Status {
    pub alive: bool,
    pub on: bool,
    pub brightness: usize
}

impl Status {

    pub fn from(core: &MutexGuard<Core>) -> Status {
        Status{
            alive: core.alive,
            on: core.on,
            brightness: core.brightness
        }
    }
}

impl ToString for Status {
    fn to_string(&self) -> String {
        json::encode(self).unwrap()
    }
}

pub fn status_report(core_ref :&Arc<Mutex<Core>>) -> Response {
    let json_content_type : Mime = "application/json".parse::<Mime>().unwrap();
    Response::with((json_content_type, status::Ok, Status::from(&core_ref.lock().unwrap()).to_string()))
}