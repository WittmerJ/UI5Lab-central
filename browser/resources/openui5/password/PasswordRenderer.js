sap.ui.define(["jquery.sap.global","sap/ui/core/Renderer","sap/m/InputBaseRenderer"],function(e,t,r){"use strict";const n=t.extend(r);n.writeInnerAttributes=function(e,t){e.writeAttribute("type","password");if(!t.getEnabled()){e.writeAttribute("readonly","readonly")}};return n},true);