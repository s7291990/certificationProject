/* [aes 256 인코딩, 디코딩에 필요한 전역 변수 선언] */
// 데이터 암호화에 사용할 비밀키
var aes256SecretKey = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)), x => ('00' + x.toString(16)).slice(-2)).join('');

// 초기화 벡터 생성
var aes256Iv = aes256SecretKey.substring(0, 16);


/* [aes256Encode 이벤트 함수 정의] */
function aes256Encode(data){
	// [aes 인코딩 수행 실시 : cbc 모드 / PKC75Padding ]
	const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(aes256SecretKey), {
		iv: CryptoJS.enc.Utf8.parse(aes256Iv), // [Enter IV (Optional) 지정 방식]
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC // [cbc 모드 선택]
	});

	return cipher.toString();
};

/* [aes256Decode 이벤트 함수 정의] */
function aes256Decode(data){
	// [aes 디코딩 수행 실시 : cbc 모드]
	const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(aes256SecretKey), {
		iv: CryptoJS.enc.Utf8.parse(aes256Iv), // [Enter IV (Optional) 지정 방식]
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC // [cbc 모드 선택]
	});

	return cipher.toString(CryptoJS.enc.Utf8);
};

function rsaEncodeSecretKey(publicKey) {
	// JSEncrypt 객체 생성 및 공개키 설정
	var encrypt = new JSEncrypt();
	encrypt.setPublicKey(publicKey);

	// 비밀키를 RSA로 암호화
	var encryptedSecretKey = encrypt.encrypt(aes256SecretKey);
	return encryptedSecretKey;
};


/*webcrypto API start */

function webcryptoEncData(db, data) {
	const encoder = new TextEncoder();
	const iv = crypto.getRandomValues(new Uint8Array(16));

	return crypto.subtle.generateKey(
		{ name: "AES-CBC", length: 256 },
		false, // 중요! extractable 옵션
		["encrypt", "decrypt"]
	)
		.then(key => {
			return db.key.clear()
				.then(() => db.key.add({ key, iv }));
		})
		.then(() => {
			return db.key.toArray();
		})
		.then(keys => {
			if (keys.length > 0) {
				const { key, iv } = keys[0];
				return crypto.subtle.encrypt(
					{ name: "AES-CBC", iv },
					key,
					encoder.encode(data)
				);
			} else {
				throw new Error("Key not found in DB");
			}
		})
		.then(encryptedData => {
			db.userinfo.clear().then(() => db.userinfo.add({ encryptedData }));
		})
		.catch(error => {
			console.error(error);
		});
}


// webcrypto 복호화
function webcryptoDecData(db) {
	let encryptedData, key, iv;

	return db.userinfo.toArray()
		.then(records => {
			if (records.length > 0) {
				encryptedData = records[0].encryptedData;
				return db.key.toArray();
			} else {
				throw new Error("No encrypted data found in DB");
			}
		})
		.then(keys => {
			if (keys.length > 0) {
				key = keys[0].key;
				iv = keys[0].iv;
				return crypto.subtle.decrypt(
					{ name: "AES-CBC", iv },
					key,
					encryptedData
				);
			} else {
				throw new Error("Key not found in DB");
			}
		})
		.then(decryptedData => {
			const decoder = new TextDecoder();
			const plaintext = decoder.decode(decryptedData);
			return plaintext;
		})
		.catch(error => {
			if (error.message === "No encrypted data found in DB") {
				return null; // db에서 찾을수없을때 null
			} else {
				console.error(error);
			}
		});
}

export { aes256Encode, aes256Decode, rsaEncodeSecretKey, webcryptoEncData,  webcryptoDecData }