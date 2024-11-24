import React from 'react'
import TouchID from 'react-native-touch-id';
const optionalConfigObject = {
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false // if true is passed, itwill allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
}
export const useFingerId = () => {
  const authenticateUser = async () => {
    TouchID.isSupported(optionalConfigObject)
  .then(biometryType => {
    // Success code
    if (biometryType === 'FaceID') {
        console.log('FaceID is supported.');
    } else {
        console.log('TouchID is supported.');
    }
  })
  .catch(error => {
    // Failure code
    console.log(error.details);
  });
  }

  return {
    authenticateUser
  }
}
