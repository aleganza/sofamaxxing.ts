"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubOrDub = exports.MediaFormat = exports.MediaStatus = void 0;
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["FINISHED"] = "Finished";
    MediaStatus["RELEASING"] = "Releasing";
    MediaStatus["NOT_YET_RELEASED"] = "Not Yet Released";
    MediaStatus["CANCELLED"] = "Cancelled";
    MediaStatus["HIATUS"] = "Hiatus";
})(MediaStatus || (exports.MediaStatus = MediaStatus = {}));
var MediaFormat;
(function (MediaFormat) {
    MediaFormat["TV"] = "TV";
    MediaFormat["TV_SHORT"] = "TV Short";
    MediaFormat["MOVIE"] = "Movie";
    MediaFormat["SPECIAL"] = "Special";
    MediaFormat["OVA"] = "OVA";
    MediaFormat["ONA"] = "ONA";
    MediaFormat["MUSIC"] = "Music";
})(MediaFormat || (exports.MediaFormat = MediaFormat = {}));
var SubOrDub;
(function (SubOrDub) {
    SubOrDub["SUB"] = "Sub";
    SubOrDub["DUB"] = "Dub";
    SubOrDub["BOTH"] = "Both";
})(SubOrDub || (exports.SubOrDub = SubOrDub = {}));
