use std::io::prelude::*;
use std::net::TcpStream;

pub struct Prismatik {
	stream: TcpStream
}

impl Prismatik {
	pub fn new(path: &str, key: &str) -> Prismatik {
		let mut prism = Prismatik {
			stream: TcpStream::connect(path).unwrap()
		};
		prism.send_key(key);
		prism
	}

	pub fn send_key(&mut self, key: &str) {
		let key_string = "apikey:{".to_string() + key + "}";
		self.stream.write(&key_string.into_bytes());
	}
}