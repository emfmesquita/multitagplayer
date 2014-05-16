package com.xablau.multitagplayer;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import com.xablau.multitagplayer.entity.Teste;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("/test-spring-config.xml")
@Transactional
public class EntityTest {

	@PersistenceContext
	private EntityManager em;
	
	@Autowired
	private SimpleBean simpleBean;
	
	@Test
	public void test(){
		Teste teste1 = this.persist("teste1");
		Teste teste2 = this.persist("teste2");
		Teste teste3 = this.persist("teste3");
		em.flush();
		this.assertTeste(teste1);
		this.assertTeste(teste2);
		this.assertTeste(teste3);
	}
	
	private Teste persist(String name){
		Teste teste = this.createTeste("teste");
		em.persist(teste);
		return teste;
	}
	
	private void assertTeste(Teste teste){
		Teste dbTeste = em.find(Teste.class, teste.getId());
		System.out.println(dbTeste.getId() + ":" + dbTeste.getName());
		Assert.assertEquals(teste.getId(), dbTeste.getId());
		Assert.assertEquals(teste, dbTeste);
	}
	
	private Teste createTeste(String name){
		Teste teste = new Teste();
		teste.setName(name);
		return teste;
	}
}
