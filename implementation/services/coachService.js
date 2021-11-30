const constants = require('../../constants')
const common_func = require("../commonFunc");
const userValidation = require("../services/userValidations/userValidationService")
const userCoachModule = require("../modules/userCoachModule")


async function updateProfile(data, access, id, profile) {
    let ans;
    if (id == data.id || access === constants.userType.MANAGER) {
        let user = combineData(data, profile)
        ans = userValidation.validateUserDetails(user, "coach")
        if (ans.canUpdate) {
            ans = await userCoachModule.updateCoachProfile(common_func.getArrayFromJson(ans.data));
            return ans
        }
        ans = []
        ans[0] = new Object()
        ans[0].status = constants.statusCode.badRequest
        return ans
    }
}

function combineData(data, profile) {
    let user = {
        id: data.id ? data.id : profile.id,
        firstName: data.firstName ? data.firstName : profile.firstname,
        lastName: data.lastName ? data.lastName : profile.lastname,
        phone: data.phone ? data.phone : profile.phone,
        email: data.email ? data.email : profile.email,
        birthDate: data.birthDate ? data.birthDate : (new Date(profile.birthdate)).toLocaleDateString(),
        address: data.address ? data.address : profile.address,
        comment: data.comment ? data.comment : profile.comment,
        oldId: data.oldId ? data.oldId : profile.id
    }
    return user
}


module.exports.updateProfile = updateProfile