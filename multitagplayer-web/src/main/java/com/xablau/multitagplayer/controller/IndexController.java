
package com.xablau.multitagplayer.controller;


import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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
    
    private List<String> tags = new ArrayList<String>();
    
    /**
     * Pré-carrega alguns dados (testes na interface)
     * 
     * @param model
     */
    private void preLoad(ModelMap model){
    	// Pré-carrega as músicas
    	if(this.dao.list().size() == 0){
    		System.out.println("Creating sample musics...");
    		this.dao.createMusic("Music 1", "resources/music.mp3");
    		this.dao.createMusic("Music 2", "resources/music2.mp3");
    		System.out.println("Sample musics created!");
    	}
    	
    	this.tags = new ArrayList<String>();
    	this.tags.add("Dungeon");
    	this.tags.add("Happy");
    	this.tags.add("Dying");
    	this.tags.add("Town");
    	this.tags.add("Day");
    	this.tags.add("Night");
    	this.tags.add("Battle");
    	this.tags.add("Fanfare");
    	this.tags.add("Final Fantasy");
    	this.tags.add("Transistor");
    	this.tags.add("Bastion");
    	this.tags.add("Swamp");
    	this.tags.add("Field");
    	this.tags.add("Forest");
    	this.tags.add("Balboa");
    	this.tags.add("Dusk");
    	this.tags.add("Dawn");
    	this.tags.add("Boss");
    	this.tags.add("Winning");
    	this.tags.add("Losing");
    	this.tags.add("Machine");
    	this.tags.add("Xablau");
    	this.tags.add("Ending");
    	this.tags.add("Emotion");
    	this.tags.add("Voice");
    	Collections.sort(this.tags);
    	model.addAttribute("tags", this.tags);
    }
    
    @RequestMapping(method = { GET, POST })
    public String index(ModelMap model) {
    	this.preLoad(model);
    	
    	ResourceBundle rb = ResourceBundle.getBundle("application");
        model.addAttribute("version", rb.getString("application.version"));
        model.addAttribute("musics", this.dao.list());
        return "index";
    }
}
