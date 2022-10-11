
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

const isPassword = function (password) {
    try {
        if (!isValidate(password)) {
            return "Passwords should be given and type string! "
        }
        if (whitespace(password)) {
            return "Make sure email should not have any  space ! " 
        }
        if(password.length>15 || password.length<8)
            return "Password length should be between 8 and 15 characters"
       
    }
    catch (error) {
        return "error.message"
    }
}




module.exports = {isEmail,isPassword, isValidate}
