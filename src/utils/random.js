const words = require("./words");
const regionCodes = require("./regionCodes-iso3166-1-alpha-2");
const languageCodes = require("./languageCodes-iso639-1");
const usernames = require("./usernames");

const date = () => {
  function randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
  const date = randomDate(new Date(2006, 0, 1), new Date());
  return date.toISOString();
};

const boolean = () => {
  return Math.random() > 0.5;
};

const int = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
};

// const possible =
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// return possible.charAt(Math.floor(Math.random() * possible.length));
const query = () => {
  return words[int(0, words.length)];
};

const username = () => {
  return usernames[int(0, usernames.length)];
};

const color = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[int(0, 15)];
  }
  return color;
};

// v4
const uuid = () => {
  var d = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const wordId = () => {
  const number = parseInt(Math.random() * 100);
  const word = query();
  const cleanWord = word
    .split(" ")[0]
    .substring(0, 4)
    .toLowerCase()
    .replace(/[^a-zA-Z]+/g, "");
  return cleanWord + number;
};

const regionCode = () => {
  if (Math.random() < 0.9) return "US";
  else if (Math.random() < 0.2) return "DE";
  else if (Math.random() < 0.2) return "FR";
  else if (Math.random() < 0.2) return "ES";
  else if (Math.random() < 0.2) return "RU";
  else return regionCodes[parseInt(0, regionCodes.length)];
};

const languageCode = () => {
  if (Math.random() < 0.95) return "en";
  else if (Math.random() < 0.2) return "de";
  else if (Math.random() < 0.2) return "fr";
  else if (Math.random() < 0.2) return "es";
  else if (Math.random() < 0.2) return "ru";
  else return languageCodes[parseInt(0, languageCodes.length)];
};

module.exports = {
  wordId,
  query,
  int,
  uuid,
  color,
  boolean,
  date,
  regionCode,
  languageCode,
  username
};
