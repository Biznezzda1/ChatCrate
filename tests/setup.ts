import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for JSDOM
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

