use rocket::{
    get,
    http::Status,
    serde::{json::Json, Serialize},
    State,
};
use std::{
    env,
    io::{Read, Write},
    os::unix::net::UnixStream,
    path::Path,
    process::{Command, Stdio},
    sync::Mutex,
    thread,
    time::Duration,
};
use zmq::{self, Socket};

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub(crate) struct StatResponse {
    percent: String,
    noun: String,
    adjective: String,
}
#[get("/stat_generate?<randomness>&<word>")]
pub(crate) fn stat_generate(
    socket: &State<Mutex<Socket>>,
    randomness: f64,
    word: Option<String>,
) -> Result<Json<StatResponse>, Status> {
    let mut socket = socket.lock().map_err(|_| Status::new(500))?;
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
    let original_dir = env::current_dir().unwrap();
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

    let context = zmq::Context::new();
    let socket = context.socket(zmq::REQ).unwrap();
    socket.connect("tcp://localhost:5555").unwrap();

    Mutex::new(socket)
}
