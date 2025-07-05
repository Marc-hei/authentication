export function bufferToBase32(data) {
  if (data instanceof ArrayBuffer) {
		data = new Uint8Array(data);
	}
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let binary_data = '';
	for (let i = 0; i < data.length; i++) {
		binary_data += data[i].toString(2).padStart(8, '0');
	}

	while (binary_data.length % 5 !== 0) {
		binary_data += '0';
	}

	let encoded = '';
	for (let i = 0; i < binary_data.length; i += 5) {
		const chunk = binary_data.slice(i, i + 5);
		const index = parseInt(chunk, 2);
		encoded += alphabet[index];
	}

	return encoded;
}


export function base32ToBuffer(encoded) {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let binary_data = '';
	for (let i = 0; i < encoded.length; i++) {
		const val = alphabet.indexOf(encoded[i].toUpperCase());
		if (val === -1) throw new Error(`Invalid Base32 character: ${encoded[i]}`);
		binary_data += val.toString(2).padStart(5, '0');
	}

	while (binary_data.length % 8 !== 0) {
		binary_data += '0';
	}

	const output = [];
	for (let i = 0; i < binary_data.length; i += 8) {
		const byte = binary_data.slice(i, i + 8);
		output.push(parseInt(byte, 2));
	}

	return new Uint8Array(output);
}

export function createRandomBase32String() {
  const emptyBuffer = new Uint8Array(20)
  const randomBuffer = crypto.getRandomValues(emptyBuffer)
  return bufferToBase32(randomBuffer)
}
