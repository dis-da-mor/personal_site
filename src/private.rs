use std::{
    ffi::OsStr,
    path::{Component, Path, PathBuf},
};

use rocket::{
    fs::{relative, NamedFile},
    get,
    http::{CookieJar, Status},
};

use crate::auth::{validate_cookie, ADMIN_KEY};

#[get("/<path..>", rank = 10)]
pub(crate) async fn files(mut path: PathBuf, cookies: &CookieJar<'_>) -> Result<NamedFile, Status> {
    let has_private = path.components().any(|component| match component {
        Component::Normal(inner) if inner.to_str().is_none_or(|inner| inner == "private") => true,
        _ => false,
    });
    if has_private && !validate_cookie(cookies.get_private(ADMIN_KEY)) {
        return Err(Status::new(403));
    }
    if path.is_dir() || path.components().next().is_none() || path.extension().is_none() {
        path.push("index.html");
    }
    NamedFile::open(Path::new(relative!("astro/dist")).join(path))
        .await
        .map_err(|_| Status::new(404))
}
