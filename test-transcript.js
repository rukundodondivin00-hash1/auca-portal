const axios = require('axios');

async function run() {
  try {
    const res = await axios.get('https://auca-ims.onrender.com/api/v1/common/student/transcript', {
      headers: {
        'x-ims-api-key': 'e779dd9128baca1d06ddcbaa32e897057dc8328910539b0162b82f96ca2777ff',
        'X-Student-Id': '25306'
      }
    });
    console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
run();
