
function whitespace(str) {
    return str.trim().indexOf(" ") >= 0
}


function isEmail(emailAdress) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // w use for char * use for breakpoint $ for end
    return regex.test(emailAdress)       
}

const isValidate= function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
  };

  const isValidPassword = (Password) => {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)
  };
  

const isValidPincode = (num) => {
    return /^[0-9]{6}$/.test(num);
  }
  
 
  const isValidString = (String) => {
    return /\d/.test(String)
  }
  const isValidPhone = (Mobile) => {
    return /^[6-9]\d{9}$/.test(Mobile)
  };



module.exports = {isEmail,isValidPassword, isValidate,isValidPincode,isValidString,isValidPhone}
