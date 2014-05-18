package com.xablau.multitagplayer.core.entity;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
public class MusicDao {
	@PersistenceContext
	private EntityManager em;
	
	public void createMusic(String name){
		Music music = new Music();
		music.setName(name);
		this.em.persist(music);
	}
	
	@SuppressWarnings("unchecked")
	public List<Music> list(){
		String qString = String.format("SELECT x FROM %s x", Music.class.getSimpleName());
		Query q = em.createQuery(qString);
		return q.getResultList();
	}
}
