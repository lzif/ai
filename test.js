let data = [];
//const formData = new FormData();
//formData.append('prompt', 'login form + tailwind class');
fetch("http://localhost:3000/ai", {
//  body: formData,
//  headers: {
//    "Content-Type": "application/x-www-form-urlencoded",
//  },
//  method: "POST",
})
  .then((response) => response.body)
  .then((body) => {
    const reader = body.getReader();

    // Buat fungsi untuk membaca stream secara rekursif
    function readStream() {
      return reader.read().then(({ value, done }) => {
        if (done) {
          console.log(data.join(""));
          // Stream sudah selesai
          return;
        }

        // Lakukan sesuatu dengan data yang dibaca
        const text = new TextDecoder().decode(value);
        data.push(text);
        console.log(text);
        // Lanjutkan membaca stream
        return readStream();
      });
    }

    // Mulai membaca stream respons
    return readStream();
  })
  .catch((error) => console.error("Error:", error))
