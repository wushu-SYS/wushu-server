/**
 * based on https://developers.google.com/drive/api/v3/quickstart/nodejs - google drive api for nodejs
 */
const fs = require('fs');
const readline = require('readline');
const constants = require('../../../constants');
const {google} = require('googleapis');
const async = require('async')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = __dirname+'/token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        let token = (fs.readFileSync(TOKEN_PATH));
        token = JSON.parse(token);
        oAuth2Client.setCredentials(token);
        return oAuth2Client
    }
    else
        getAccessToken(oAuth2Client)
        console.log('Token not exist')
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client){
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
        });
    });
}

/**
 * search for folder in google drive by name
 * @param auth - authentication
 * @param name - folder name to search
 * @returns the jason object {find, folderId}, find - will be true id the folder was found, folderId - the id of the found folder
 */
async function findFolderByName(auth,name,parent) {
    let result =new Object();
    const drive = google.drive({version: 'v3', auth});
    await drive.files.list({
        q: `name='${name}'`,
        fields: 'nextPageToken, files(id, name)',
        parents : parent
    }).then((res)=>{
        if(res.data.files.length!=0) {
            result.find = true
            result.folderID=res.data.files[0].id;
        }
        else
            result.find=false
    }).catch((err)=>{
        console.log(err)
    });
    return result
}

/**
 * upload picture to google drive (public func)
 * @param auth - authentication
 * @param id - user id
 * @param file_path - path for the picture to upload
 * @param picName - new name for the picture
 * @param userType - user type
 * @returns id of the created file picture
 */
async function uploadUserPicture(auth,id,file_path,picName,userType){
    let parentsFolder = await findFolderByName(auth,id,[]);
    let folderId =parentsFolder.folderID;
    let fileId = undefined;
    if(!parentsFolder.find)
        folderId = await createGoogleDriveTreeFolder(auth,id,userType);
    await uploadGoogleDrivePicture(auth,folderId,file_path,picName)
        .then(async(res)=>{
            fileId = res;
            await setReadPermission(auth,fileId)

        }).catch((err)=>{console.log(err)})
    return fileId;
}

/**
 * create google tree folder, parent and sub folder according to the user type
 * @param auth - authentication
 * @param name - parent folder name
 * @returns parent folder id
 */
async function createGoogleDriveTreeFolder(auth,name,userType){
    let parentsFolder = await createGoogleDriveFolder(auth,name);
    await createSubGoogleDriveFolder(auth,parentsFolder,userType);
    return parentsFolder
}

/**
 * create single folder in google drive
 * @param auth - authentication
 * @param name - folder name
 * @param parent - parent folder id (optional)
 * @returns new folder id
 */
async function createGoogleDriveFolder(auth,name,parent){
    let newFolderId = undefined;
    let parentArr = [];
    if (parent!=undefined)
        parentArr.push(parent)
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        parents : parentArr

    };
    console.log(parentArr)
    await drive.files.create({
        resource: fileMetadata,
        fields: 'name,id',
    }).then((res)=>{
        newFolderId=res.data.id;
    }).catch((err)=>{
        console.error(err);
    });
    return newFolderId
}

/**
 * create sub folders in google drive by user type
 * @param auth - authentication
 * @param parentFolderId - parent folder id
 * @param userType - sportsman/coach/judge
 */
async function createSubGoogleDriveFolder(auth,parentFolderId,userType){
    switch (userType) {
        case constants.userType.sportsman:
            console.log(parentFolderId)
            await createGoogleDriveFolder(auth,constants.googleDriveFolderNames.medical,parentFolderId);
            await createGoogleDriveFolder(auth,constants.googleDriveFolderNames.insurance,parentFolderId)
        case constants.userType.coach:
            break;
        case constants.userType.judge:
            break;
    }
}

/**
 * upload picture to google drive
 * @param auth - authentication
 * @param parentFolderId - parent folder id
 * @param file_path - path for the picture to upload
 * @param picName - new name for the picture
 * @returns new file id of the picture
 */
async function uploadGoogleDrivePicture(auth,parentFolderId,file_path,picName){
    let findPreFile =await findFileInParentFolderByName(auth,parentFolderId,picName);
    let fileId = undefined;
    const drive = google.drive({version: 'v3', auth});
    if(findPreFile.find)
        await deleteGoogleDriveFile(auth,parentFolderId,findPreFile.fileId);
    var fileMetadata = {
        'name': picName,
        parents: [parentFolderId]
    };
    var media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(file_path)
    };
    await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'name,id'
    }).then((res)=>{
        fileId=res.data.id

    }).catch((err)=>{console.error(err);});
    return fileId;
}

/**
 * find file by name inside parent folder with the given id
 * @param auth - authentication
 * @param parentFolderId - parent folder id
 * @param Name - file name to search
 * @returns json object {find, fileId}, find - true if the file found, fileId - the id of the found file
 */
async function findFileInParentFolderByName(auth,parentFolderId,Name){
    let result= new Object();
    result.find = false;
    const drive = google.drive({version: 'v3', auth});
    let parentArr = [];
    if (parentFolderId)
        parentArr.push(parentFolderId);
    await drive.files.list({
        q: `name='${Name}'`,
        fields: 'nextPageToken, files(id, name)',
        parents: parentArr

    }).then((res)=>{
        if(res.data.files.length!=0) {
            result.find = true
            result.fileId= res.data.files[0].id;
        }
    }).catch((err)=>{
        console.log(err)
    });
    return result
}

/**
 * delete file with the given file id inside the parent folder
 * @param auth - authentication
 * @param parentFolderId - parent folder id
 * @param fileId - file id to delete
 */
async function deleteGoogleDriveFile(auth, parentFolderId, fileId) {
    const drive = google.drive({version: 'v3', auth});
    let parentArr = []
    if (parentFolderId)
        parentArr.push(parentFolderId)
    drive.files.delete({
        'fileId':fileId,
        parents : parentArr
    }).then((res)=>{
        console.log("google drive file has been deleted")
    }).catch((err)=>{console.log(err)})
}

/**
 * set read permission to file with the given id
 * @param auth - authentication
 * @param fileId - file id
 */
async function setReadPermission(auth,fileId){
    const drive = google.drive({version: 'v3', auth});
    var permission=
        {
            'type': 'anyone',
            'role': 'reader'
        }
// Using the NPM module 'async'
    await drive.permissions.create({
            resource: permission,
            fileId: fileId,
            fields: 'id',
        }, function (err, res) {
            if (err) {
                // Handle error...
                console.error(err);
            }
        });
}

async function uploadSportsmanMedicalScan(auth,id,file_path,fileName,userType){
    let parentsFolder = await findFolderByName(auth,id,[]);
    let folderId = parentsFolder.folderID;
    let fileId = undefined;
    if(!parentsFolder.find)
        folderId = await createGoogleDriveTreeFolder(auth,id,userType);
    let medicalScanFolder = await findFolderByName(auth,constants.googleDriveFolderNames.medical,[folderId]);
    let medicalScanFolderId = medicalScanFolder.folderID
    await uploadGoogleDriveMedicalScan(auth,medicalScanFolderId,file_path,fileName)
        .then(async(res)=>{
            fileId = res;
            await setReadPermission(auth,fileId)

        }).catch((err)=>{console.log(err)})
    return fileId;
}

async function uploadGoogleDriveMedicalScan(auth,medicalScanFolderId,file_path,fileName){
    let fileId = undefined;
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
        'name': fileName,
        parents: [medicalScanFolderId]
    };
    var media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(file_path)
    };
    await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'name,id'
    }).then((res)=>{
        fileId=res.data.id

    }).catch((err)=>{console.error(err);});
    return fileId;

}
module.exports.authorize = authorize;
module.exports.uploadUserPicture = uploadUserPicture;
module.exports.uploadSportsmanMedicalScan = uploadSportsmanMedicalScan;


