use std::{
    io::{Write, stdin, stdout},
    path::Path,
};

use image::{self, ImageReader, imageops::FilterType};
fn main() {
    let mut in_string = String::new();
    let mut out_string = String::new();
    print!("input dir: ");
    stdout().flush().unwrap();
    stdin().read_line(&mut in_string).unwrap();
    in_string = in_string.trim().to_string();
    let in_ = Path::new(&format!("../{in_string}"))
        .canonicalize()
        .unwrap();
    print!("output dir: ");
    stdout().flush().unwrap();
    stdin().read_line(&mut out_string).unwrap();
    out_string = out_string.trim().to_string();
    let out = Path::new(&format!("../{out_string}"))
        .canonicalize()
        .unwrap();
    std::fs::read_dir(in_)
        .unwrap()
        .map(|x| x.unwrap().path())
        .filter_map(|path| {
            ImageReader::open(path.clone())
                .ok()
                .and_then(|img| img.decode().ok())
                .map(|img| (img, path))
        })
        .for_each(|(img, path)| {
            let image = img.resize(500, 500, FilterType::Gaussian);
            let name = path.file_stem().unwrap().to_str().unwrap();
            let out_name = format!("{name}_small.png");
            let mut out_path = out.clone();
            out_path.push(out_name);
            image
                .save_with_format(out_path, image::ImageFormat::Png)
                .unwrap();
        });
}
