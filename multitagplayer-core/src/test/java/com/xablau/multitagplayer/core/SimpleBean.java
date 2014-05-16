package com.xablau.multitagplayer.core;

import org.springframework.stereotype.Component;

@Component
public class SimpleBean {
	
	public static final String SERVICE_RETURN = "service";

	public String service(){
		return SERVICE_RETURN;
	}
}
