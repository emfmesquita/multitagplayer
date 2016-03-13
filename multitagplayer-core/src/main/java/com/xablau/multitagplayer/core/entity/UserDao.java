
package com.xablau.multitagplayer.core.entity;


import java.util.Date;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


@Component
@Transactional
public class UserDao {

	@PersistenceContext
	private EntityManager em;

	public void createUser(String email, String refreshToken, String accessToken, Date expiresAt) {
		User user = new User();
		user.setEmail(email);
		user.setRefreshToken(refreshToken);
		user.setAccessToken(accessToken);
		user.setExpiresAt(expiresAt);
		this.em.persist(user);
	}

	public User fromEmail(String email){
		Query q = em.createNamedQuery(User.FROM_EMAIL);
		q.setParameter(1, email);
		return (User) q.getSingleResult();
	}
}
