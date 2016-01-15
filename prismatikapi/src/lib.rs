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

	pub fn light_count(&mut self) -> usize {
		100
	}

	pub fn send_key(&mut self, key: &str) {
		let key_string = "apikey:{".to_string() + key + "}";
		self.stream.write(&key_string.into_bytes());
	}

	pub fn set_brightness(&mut self, level: usize) {
		let brightness_string = "setbrightness:".to_string() + &level.to_string();
		self.stream.write(&brightness_string.into_bytes());
	}

	pub fn set_smooth(&mut self, level: usize) {
		let smooth_string = "setsmooth:".to_string() + &level.to_string();
		self.stream.write(&smooth_string.into_bytes());
	}
}