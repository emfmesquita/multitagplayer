package com.xablau.multitagplayer.controller;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.util.ResourceBundle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.xablau.multitagplayer.core.entity.UserDao;
import com.xablau.multitagplayer.web.GapiService;

@Controller
@RequestMapping("/")
public class IndexController {

	@Autowired
	private UserDao dao;

	@Autowired
	private GapiService gapiService;

	@RequestMapping(method = { GET, POST })
	public String index(ModelMap model,
			@RequestParam(value = "code", required = false) String code)
			throws Exception {

		if (!StringUtils.isEmpty(code)) {
			String token = gapiService.getAccessToken(code);
			model.addAttribute("access_token", token);
		}

		ResourceBundle rb = ResourceBundle.getBundle("application");
		model.addAttribute("version", rb.getString("application.version"));
		return "index";
	}
}
