use rocket::{get, http::Status, State};
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

#[get("/stat_generate?<randomness>&<word>")]
pub(crate) fn stat_generate(
    stream: &State<Mutex<UnixStream>>,
    randomness: f64,
    word: Option<String>,
) -> Result<String, Status> {
    let mut stream = stream.lock().map_err(|_| Status::new(500))?;
    stream
        .write(format!("{randomness} {}", word.unwrap_or_else(|| "".to_string())).as_bytes())
        .map_err(|_| Status::new(500))?;
    let mut msg = String::new();
    stream
        .read_to_string(&mut msg)
        .map_err(|_| Status::new(500))?;
    return Ok(msg);
}

pub(crate) fn stat_state() -> Mutex<UnixStream> {
    let original_dir = env::current_dir().unwrap();
    let target_path = Path::new("./model_python")
        .canonicalize()
        .expect("no 'model_python' directory");
    env::set_current_dir(target_path).unwrap();

    //Command::new("ls").spawn().unwrap();
    //thread::sleep(Duration::from_secs(100));

    thread::spawn(|| {
        Command::new("./main.bin")
            .stderr(Stdio::inherit())
            .output()
            .unwrap();
    });
    thread::sleep(Duration::from_secs(3));
    let stream = UnixStream::connect("/tmp/sock").unwrap();
    env::set_current_dir(original_dir).unwrap();
    Mutex::new(stream)
}
