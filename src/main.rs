// https://www.youtube.com/watch?v=qCXFi4Jg11c

use actix_web::{App, HttpResponse, HttpServer, Responder, get, middleware::Logger};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(move || App::new().service(index).wrap(Logger::default()))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("<h1>hello</h1><p>world</p>")
}
