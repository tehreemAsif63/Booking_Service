"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPosition = void 0;
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const MessageException_1 = require("../exceptions/MessageException");
const geocoder = (0, node_geocoder_1.default)({
    provider: 'google',
    apiKey: 'AIzaSyDQlD3-cmPiepBAeHB4NYXdN12HIyCjhl4',
});
const createPosition = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield geocoder.geocode(address);
        if (result.length > 0) {
            const location = result[0];
            return {
                lat: location.latitude,
                lng: location.longitude
            };
        }
        else {
            throw new MessageException_1.MessageException({
                code: 422,
                message: 'Failed to retrieve coordinates for the given address.',
            });
        }
    }
    catch (error) {
        console.log(error);
        throw new MessageException_1.MessageException({
            code: 500,
            message: 'Error during geocoding process.',
        });
    }
});
exports.createPosition = createPosition;
