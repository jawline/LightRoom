use fccore::Core;
use std::sync::{Arc, Mutex};
use std::thread::{spawn, sleep_ms, JoinHandle};

const TAG: &'static str = "fccore_logic";

pub fn start_logic_thread(core: &Arc<Mutex<Core>>) -> JoinHandle<()> {
    let thread_core = core.clone();
    thread_core.lock().unwrap().log_mut().add(TAG, "starting logic thread loop");
    spawn(move || { fccore_thread_loop(thread_core); } )
}

fn fccore_thread_loop(core_ref: Arc<Mutex<Core>>) {
    core_ref.lock().unwrap().log_mut().add(TAG, "Starting core logic");

    while core_ref.lock().unwrap().alive {
    	core_ref.lock().unwrap().update();
    	sleep_ms(25);
    }

    core_ref.lock().unwrap().log_mut().add(TAG, "Core is no longer alive, logic thread exit");
}