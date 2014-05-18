package com.xablau.multitagplayer.controller;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import com.xablau.multitagplayer.core.entity.MusicDao;

@Controller
@RequestMapping("/")
public class IndexController {
	
	@Autowired
	private MusicDao dao;
	
	@RequestMapping(method = {GET, POST})
	public String index(ModelMap model) {
		model.addAttribute("message", "Hello Heroku! [3]");
		dao.createMusic(System.currentTimeMillis() + "");
		model.addAttribute("musics", dao.list());
		return "index";
	}
}
