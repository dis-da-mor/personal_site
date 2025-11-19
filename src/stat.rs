use rocket::{
    get,
    http::Status,
    serde::{json::Json, Serialize},
    State,
};
use rocket_governor::RocketGovernor;
use std::{
    env::{self, current_dir},
    path::Path,
    process::{Command, Stdio},
    sync::Mutex,
    thread,
    time::Duration,
};
use zmq::{self, Socket};

use crate::RateLimit;

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub(crate) struct StatResponse {
    percent: String,
    noun: String,
    adjective: String,
}
#[get("/stat_generate?<randomness>&<word>")]
pub(crate) fn stat_generate(
    _rate_limit: RocketGovernor<RateLimit>,
    socket: &State<Mutex<Socket>>,
    randomness: f64,
    word: Option<String>,
) -> Result<Json<StatResponse>, Status> {
    let socket = socket.lock().map_err(|_| Status::new(500))?;
    socket
        .send(
            format!("{randomness} {}", word.unwrap_or_else(|| "".to_string())).as_bytes(),
            0,
        )
        .map_err(|err| {
            eprintln!("{err}");
            Status::new(500)
        })?;
    let msg = socket
        .recv_string(0)
        .map_err(|err| {
            eprintln!("{err}");
            Status::new(500)
        })?
        .map_err(|err| {
            eprintln!("invalid string: {:#?}", err);
            Status::new(500)
        })?;
    let back = msg.split_whitespace().collect::<Vec<_>>();
    Ok(Json(StatResponse {
        percent: back[0].to_string(),
        noun: back[1].to_string(),
        adjective: back[2].to_string(),
    }))
}

pub(crate) fn stat_state() -> Mutex<Socket> {
    let original_directory = current_dir().unwrap();
    let target_path = Path::new("./model_python")
        .canonicalize()
        .expect("no 'model_python' directory");
    env::set_current_dir(target_path).unwrap();
    thread::spawn(|| {
        Command::new("./main.bin")
            .stderr(Stdio::inherit())
            .output()
            .unwrap();
    });
    thread::sleep(Duration::from_secs(5));
    let context = zmq::Context::new();
    let socket = context.socket(zmq::REQ).unwrap();
    socket.connect("tcp://localhost:5555").unwrap();
    env::set_current_dir(original_directory).unwrap();
    Mutex::new(socket)
}
