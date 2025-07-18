use actix_web::{App, HttpServer, web::Data};
use stat::{stat_generate, stat_state};
mod stat;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().app_data(Data::new(stat_state())))
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}
