const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const constants = require('./constants');

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
    /*fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });*/
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
            //return oAuth2Client
            //callback(oAuth2Client);
        });
    });
}

async function findFolderByName(auth,name) {
    let result =new Object();
     await drive.files.list({
         q: `name='${name}'`,
        fields: 'nextPageToken, files(id, name)',
    }).then((res)=>{
        if(res.data.files.length!=0) {
            console.log(res)
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
async function uploadUserPicture(auth,id,file_path,picName){
    let res = await findFolderByName(auth,id);
    let folderId =res.folderID;
    if(!res.find)
        folderId = await createGoogleDriveTreeFolder(auth,id);
    await uploadGoogleDrivePicture(auth,folderId,file_path,picName)
}
async function createGoogleDriveTreeFolder(auth,name){
    let parentsFolder = await createGoogleDriveFolder(auth,name);
    await createSubGoogleDriveFolder(auth,constants.googleDriveFolderNames.medical,parentsFolder);
    return parentsFolder
}

async function findFile(auth,folderId,Name){
    let result= new Object();
    result.find = false;
    await drive.files.list({
        q: `name='${Name}'`,
        fields: 'nextPageToken, files(id, name)',
        parents: [folderId]

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

async function deleteGoogleDriveFile(auth, folderId, fileId) {
    drive.files.delete({
        'fileId':fileId,
        parents : [folderId]
    }).then((res)=>{
        console.log(res)
    }).catch((err)=>{console.log(err)})
}

async function uploadGoogleDrivePicture(auth,folderId,file_path,picName){
    let findPreFile =await findFile(auth,folderId,picName);
    if(findPreFile.find)
       await deleteGoogleDriveFile(auth,folderId,findPreFile.fileId);
    var fileMetadata = {
        'name': picName,
        parents: [folderId]
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
        console.log(res)
    }).catch((err)=>{console.error(err);})

}
async function createGoogleDriveFolder(auth,name){
    let newFolderId = undefined;
    var fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    await drive.files.create({
        resource: fileMetadata,
        fields: 'name,id'
    }).then((res)=>{
        newFolderId=res.data.id;
    }).catch((err)=>{
        console.error(err);
    });
    return newFolderId
}
async function createSubGoogleDriveFolder(auth,name,folderId){
    let newFolderId = undefined;
    var fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        parents: [folderId]

    };
    await drive.files.create({
        resource: fileMetadata,
        fields: 'name,id'
    }).then((res)=>{
        newFolderId=res.data.id;
    }).catch((err)=>{
        console.error(err);
    });
    return newFolderId
}

module.exports.authorize = authorize;
module.exports.uploadUserPicture = uploadUserPicture;


