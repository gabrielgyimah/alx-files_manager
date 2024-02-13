#!/usr/bin/node

const sha1 = require('sha1');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { v4 } = require('uuid');

export const pwdHashed = (pwd) => sha1(pwd);
export const getAuthzHeader = (req) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  return header;
};

export const getToken = (authzHeader) => {
  const tokenType = authzHeader.substring(0, 6);
  if (tokenType !== 'Basic ') {
    return null;
  }
  return authzHeader.substring(6);
};

export const decodeToken = (token) => {
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  if (!decodedToken.includes(':')) {
    return null;
  }
  return decodedToken;
};

export const getCredentials = (decodedToken) => {
  const [email, password] = decodedToken.split(':');
  if (!email || !password) {
    return null;
  }
  return { email, password };
};

export const createFile = (data) => {
  const DEFAULT = '/tmp/files_manager';
  const path = (process.env.FOLDER_PATH) ? process.env.FOLDER_PATH : DEFAULT;
  const filename = v4();
  const localPath = `${path}/${filename}`;
  if (!existsSync(path)) {
    mkdirSync(path);
  }
  writeFileSync(localPath, data, { encoding: 'base64' });
  return localPath;
};
