FROM meyskens/desktop-base

ENV version=8.4.0

RUN wget http://trial2.autodesk.com/NET17SWDLD/2017/EGLPRM/ESD/Autodesk_EAGLE_${version}_English_Linux_64bit.tar.gz && \
    tar -xzf Autodesk_EAGLE_${version}_English_Linux_64bit.tar.gz && \
    rm -fr Autodesk_EAGLE_${version}_English_Linux_64bit.tar.gz

USER user

CMD /eagle-${version}/eagle