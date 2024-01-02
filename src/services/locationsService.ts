import axios from 'axios';
import { API_KEY } from '../config.js';

interface Prediction {
  description: string;
  matched_substrings: [];
  place_id: string;
  reference: string;
  structured_formatting: [];
  terms: [];
  types: [];
}

const getLocations = async (input: string) => {
  const locationsURL = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${API_KEY}`;

  const response = await axios.get(locationsURL);

  return response.data.predictions
    .slice(0, 5)
    .map((prediction: Prediction) => prediction.description);
};

export default { getLocations };
