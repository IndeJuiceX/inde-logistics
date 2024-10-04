import { Client } from '@opensearch-project/opensearch';

// Set up OpenSearch client using basic authentication
const osClient = new Client({
  node: 'https://search-dynamologistics-u4v3lv2762atz5eiua3stl7xum.eu-west-2.es.amazonaws.com',  // Your OpenSearch domain
  auth: {
    username: process.env.OS_USERNAME,     // Username from environment variables
    password: process.env.OS_PASSWORD      // Password from environment variables
  }
});

export default osClient;
