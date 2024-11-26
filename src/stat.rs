use rocket::{
    async_trait, get,
    http::Status,
    request::{FromRequest, Outcome},
    response::content::RawHtml,
    Request, State,
};
use std::{
    io::{Read, Write},
    os::unix::net::UnixStream,
    process::{Command, Stdio},
    sync::Mutex,
    thread,
    time::Duration,
};
use user_agent_parser::Device;

pub(crate) struct Stat(String);
const SPACE_REPLACER: char = '-';
const SHIFT: u32 = 10;
const START_POINT: u32 = 'a' as u32;

#[async_trait]
impl<'r> FromRequest<'r> for Stat {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let Some(param) = request.uri().query().and_then(|query| {
            query
                .segments()
                .find(|segment| segment.0 == "id")
                .map(|segment| segment.1)
        }) else {
            return Outcome::Error((Status::BadRequest, ()));
        };
        match decode(param) {
            Ok(x) => Outcome::Success(x),
            Err(x) => Outcome::Error((Status::BadRequest, x)),
        }
    }
}

fn decode(param: &str) -> Result<Stat, ()> {
    let stat = param
        .split(',')
        .into_iter()
        .enumerate()
        .map(|(index, word)| {
            if index == 0 {
                word.parse::<f32>().map_err(|_| ())?;
                return Ok(word.to_string());
            }
            word.chars()
                .map(|current_char| match current_char {
                    SPACE_REPLACER => Ok(' '),
                    char if !char.is_ascii_lowercase() => Err(()),
                    char => {
                        let digit = char as u32 - START_POINT;
                        Ok(char::from_u32(
                            START_POINT + (digit).checked_sub(SHIFT).unwrap_or(26 - SHIFT + digit),
                        )
                        .unwrap())
                    }
                })
                .collect::<Result<String, ()>>()
        })
        .map(|word| word.map(|value| format!("\"{}\"", value)))
        .collect::<Result<Vec<String>, ()>>()?
        .join(",");
    Ok(Stat(format!("[{}]", stat)))
}

#[get("/Stats")]
pub(crate) fn stats(
    stat: Result<Stat, ()>,
    _user_agent: user_agent_parser::UserAgent,
    device: Device,
) -> RawHtml<String> {
    let stats_file = include_str!("../public/stats.html");
    let stats_file = stats_file
        .replace(
            "\"{getWords}\"",
            &stat
                .map(|stat| stat.0)
                .unwrap_or_else(|_| "undefined".into()),
        )
        .replace(
            "\"{isMobile}\"",
            if device.name == Some("Mobile".into()) {
                "true"
            } else {
                "false"
            },
        );
    RawHtml(stats_file)
}
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
    thread::spawn(|| {
        Command::new("./model.bin")
            .stderr(Stdio::inherit())
            .output()
            .unwrap();
    });
    thread::sleep(Duration::from_secs(3));
    let stream = UnixStream::connect("/tmp/sock").unwrap();
    Mutex::new(stream)
}
