
package com.xablau.multitagplayer.controller;


import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.util.ResourceBundle;

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
    
    @RequestMapping(method = { GET, POST })
    public String index(ModelMap model) {
    	// Pré-carrega as músicas
    	if(this.dao.list().size() == 0){
    		System.out.println("Creating sample musics...");
    		this.dao.createMusic("Music 1", "resources/music.mp3");
    		this.dao.createMusic("Music 2", "resources/music2.mp3");
    		System.out.println("Sample musics created!");
    	}
    	
    	ResourceBundle rb = ResourceBundle.getBundle("application");
        model.addAttribute("version", rb.getString("application.version"));
        model.addAttribute("musics", this.dao.list());
        return "index";
    }
}
