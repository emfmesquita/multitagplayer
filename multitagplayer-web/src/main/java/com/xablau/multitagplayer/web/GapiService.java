package com.xablau.multitagplayer.web;

import java.net.URI;

import org.apache.commons.io.IOUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

@Component
public class GapiService {

	public String getAccessToken(String code) throws Exception {
		CloseableHttpClient httpclient = HttpClients.createDefault();

		URI uri = new URIBuilder()
				.setScheme("https")
				//
				.setHost("www.googleapis.com")
				//
				.setPath("/oauth2/v4/token")
				//
				.setParameter("code", code)
				//
				.setParameter("client_id",
						"1005266131738-3hcds8n24ubv16rmls7vlktd9q1hjj98.apps.googleusercontent.com")
				//
				.setParameter("client_secret", "iQfvmUZqoM1ltoZDxr-j9Tpd")
				.setParameter("redirect_uri",
						"http://localhost:8080/MultiTagPlayer/") //
				.setParameter("grant_type", "authorization_code") //
				.build();

		HttpPost httppost = new HttpPost(uri);

		CloseableHttpResponse response = null;
		try {
			response = httpclient.execute(httppost);
			String content = IOUtils
					.toString(response.getEntity().getContent());
			JSONObject json = new JSONObject(content);
			return json.isNull("access_token") ? "" : json
					.getString("access_token");
		} finally {
			response.close();
		}
	}
}
