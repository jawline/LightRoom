#![allow(dead_code)]

use fccore::config::Config;
use simplelog::Log;
use prismatikapi::*;

use time;

const TAG : &'static str = "core";
const LOG_DIR : &'static str = "./logs/";

pub struct Core {

    /**
     * Is the core alive
     */
    pub alive: bool,

    pub on: bool,
    pub brightness: usize,

    prismatik: Box<Prismatik + Send>,
  
    /**
     * configuration for the core
     */
    config: Config,
  
    /**
     * Core log, stores log messages and timestamps
     */
    log: Log,

    pub r: usize,
    pub g: usize,
    pub b: usize
}

fn load_api(config: &Config) -> Box<Prismatik + Send> {
    if config.use_dummy {
        Box::new(Dummy::new())
    } else {
        Box::new(CoreApi::new(&config.server_url, &config.api_key).unwrap())
    }
}

impl Core {

    pub fn new(config_file : &str) -> Core {
        let config = Config::load(config_file);
        
        let mut core = Core {
            alive: true,
            brightness: 100,
            on: false,
            prismatik: load_api(&config),
            log: Log::new(&format!("{}log{}", LOG_DIR, time::now().to_timespec().sec), config.log_config.log_limit),
            config: config,
            r: 0,
            g: 0,
            b: 0
        };

        core.log.add(TAG, &format!("Connecting to server {} with key {}", &core.config.server_url, &core.config.api_key));
        core.prismatik.set_brightness(75);
        core.prismatik.set_smooth(150);
        set_all_lights(&mut *core.prismatik, 0, 0, 0);
        core.set_on(false);
        core
    }

    pub fn set_on(&mut self, on: bool) {
        self.on = on;
        self.prismatik.set_on(on);
        self.log.add(TAG, &("Set ON to ".to_string() + &on.to_string()));
    }

    pub fn set_color_all(&mut self, r: usize, g: usize, b: usize) {
        self.r = r;
        self.g = g;
        self.b = b;
        set_all_lights(&mut *self.prismatik, r, g, b);
        self.log.add(TAG, &("Set color to ".to_string() + &r.to_string() + ", " + &g.to_string() + ", " + &b.to_string()));
    }

    pub fn set_brightness(&mut self, b: usize) {
        self.brightness = b;
        self.prismatik.set_brightness(b);
        self.log.add(TAG, &format!("Set brightness to {}", b));
    }

    pub fn update(&mut self) {}

    /**
     * Get the core config struct
     */
    pub fn config(&self) -> &Config { &self.config }
    
    /**
     * Return the core log
     */
    pub fn log(&self) -> &Log { &self.log }
    
    /**
     * Return the core log as mutable
     */
     pub fn log_mut(&mut self) -> &mut Log { &mut self.log }
}
