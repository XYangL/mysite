from django.conf.urls import patterns, url
from PresentSystem import views

urlpatterns = patterns('',
	
	# ex:/PresentSystem/
	url(r'^$', views.index, name='index'),

	# ex: /PresentSystem/convert/
	url(r'^convert/$', views.convert, name='convert'),

	# ex: /PresentSystem/parsed/
	# url(r'^parsed/$', views.parsed, name='parsed'),

	# ex: /PresentSystem/test/
	url(r'^test/$', views.test, name='test'),
)