const constants = require("../../constants");
const userValidation = require("../services/userValidations/userValidationService")
const common_func = require("../commonFunc");
const userJudgeModule = require("../modules/userJudgeModule");

async function updateProfile(data, access, id, profile) {
    let ans;
    if (id == data.id || access === constants.userType.MANAGER) {
        let user = combineData(data, profile)
        ans = userValidation.validateUserDetails(user, "judge");
        if (ans.canUpdate) {
            ans = await userJudgeModule.updateJudgeProfile(common_func.getArrayFromJson(ans.data));
            return ans
        }
        error=ans.error
        ans = []
        ans[0] = new Object()
        ans[0].status = constants.statusCode.badRequest
        ans[0].errors = error
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
        comment: data.comment,
        facebook: data.facebook,
        instagram: data.instagram,
        anotherLink: data.anotherLink,
        oldId: data.oldId ? data.oldId : profile.id
    }
    return user
}


module.exports.updateProfile = updateProfile