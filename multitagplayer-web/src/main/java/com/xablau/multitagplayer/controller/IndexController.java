package com.xablau.multitagplayer.controller;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class IndexController {

	@RequestMapping(method = {GET, POST})
	public String index(ModelMap model) {
		model.addAttribute("message", "Hello Heroku! [3]");
		return "index";
	}
}
