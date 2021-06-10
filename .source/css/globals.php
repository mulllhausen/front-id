<?php

// global css properties

define("css_background_color0_hex", "#ffffff"); // main background color
define("css_background_color1_hex", "#d1d5da"); // light grey

define("css_font_color0_hex", "#000000"); // main font color (black)

define("css_page_width_percent", 80);

// hexagon profile pic
define("css_hexagon_profile_pic_height", 150); // px (the logo img is square)

// px (as per the hexagon formula in images/hexagon.svg)
if (build_for == "dev") define("css_hexagon_profile_pic_click_width", 130);

// header
define("css_header_line_height", 18); // px

?>
