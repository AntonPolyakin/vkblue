import trim from 'lodash/trim';
import deburr from 'lodash/deburr';
import unescape from 'lodash/unescape';

export default function clearString(input) {
  let string = unescape(input || '');
  string = deburr(string);
  string = string
    .replace(/(\s)+/g, ' ')        
    .replace(/\s*\(.*?\)\s*/g, '') 
    .replace(/\s*\[.*?]\s*/g, '')  
    .replace(/[^\wа-яёі&.Λ]+/gi, ' '); 
  string = trim(string);

  return string;
}
