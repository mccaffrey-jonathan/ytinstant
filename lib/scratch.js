function log(msg)
{
	document.getElementById("LOG").innerHTML += (msg + "\n");
}
 
function SpiderGLExample1()
{
	;
}
 
SpiderGLExample1.prototype =
{
	load : function(gl)
	{
		log("SpiderGL Version : " + SGL_VERSION_STRING + "\n");
 
		/*************************************************************/
		this.xform     = new SglTransformStack();
		this.angle     = 0.0;
		this.primitives = "triangles";
		/*************************************************************/
 
 
		/*************************************************************/
		var simpleVsrc = sglNodeText("SIMPLE_VERTEX_SHADER");
		var simpleFsrc = sglNodeText("SIMPLE_FRAGMENT_SHADER");
		var simpleProg = new SglProgram(gl, [simpleVsrc], [simpleFsrc]);
		log(simpleProg.log);
		this.simpleProg = simpleProg;
		/*************************************************************/
 
 
		/*************************************************************/
		var boxPositions = new Float32Array
		([
			-0.5, -0.5,  0.5,
			 0.5, -0.5,  0.5,
			-0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			-0.5, -0.5, -0.5,
			 0.5, -0.5, -0.5,
			-0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5
		]);
 
		var boxColors = new Float32Array
		([
			0.0, 0.0, 1.0,
			1.0, 0.0, 1.0,
			0.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			0.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			0.0, 1.0, 0.0,
			1.0, 1.0, 0.0
		]);
 
		var boxTrianglesIndices = new Uint16Array
		([
			0, 1, 2,  2, 1, 3,  // front
			5, 4, 7,  7, 4, 6,  // back
			4, 0, 6,  6, 0, 2,  // left
			1, 5, 3,  3, 5, 7,  // right
			2, 3, 6,  6, 3, 7,  // top
			4, 5, 0,  0, 5, 1   // bottom
		]);
 
		var boxEdgesIndices = new Uint16Array
		([
			0, 1, 1, 3, 3, 2, 2, 0,  // front
			5, 4, 4, 6, 6, 7, 7, 5,  // back
			0, 4, 1, 5, 3, 7, 2, 6   // middle
		]);
 
		var box = new SglMeshGL(gl);
		box.addVertexAttribute("position", 3, boxPositions);
		box.addVertexAttribute("color",    3, boxColors);
		box.addArrayPrimitives("vertices", gl.POINTS, 0, 8);
		box.addIndexedPrimitives("triangles", gl.TRIANGLES, boxTrianglesIndices);
		box.addIndexedPrimitives("edges",     gl.LINES,    boxEdgesIndices);
		this.boxMesh = box;
		/*************************************************************/
	},
 
	keyPress : function(gl, keyCode, keyString)
	{
		switch (keyString)
		{
			case "1": this.primitives = "triangles"; break;
			case "2": this.primitives = "edges";     break;
			case "3": this.primitives = "vertices";  break;
			default : break;			
		}
	},
 
	update : function(gl, dt)
	{
		this.angle += 90.0 * dt;
	},
 
	draw : function(gl)
	{
		var w = this.ui.width;
		var h = this.ui.height;
 
		gl.clearColor(0.2, 0.2, 0.6, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
 
		gl.viewport(0, 0, w, h);
 
		this.xform.projection.loadIdentity();
		this.xform.projection.perspective(sglDegToRad(60.0), w/h, 0.1, 100.0);
 
		this.xform.view.loadIdentity();
		this.xform.view.lookAt(0.0, 2.0, 3.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
 
		this.xform.model.loadIdentity();
		this.xform.model.rotate(sglDegToRad(this.angle), 0.0, 1.0, 0.0);
		this.xform.model.scale(1.5, 1.5, 1.5);
 
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
 
		var boxUniforms = { u_mvp : this.xform.modelViewProjectionMatrix };
		sglRenderMeshGLPrimitives(this.boxMesh, this.primitives, this.simpleProg, null, boxUniforms);
 
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
	}
};
 
sglRegisterCanvas("SGL_CANVAS1", new SpiderGLExample1(), 60.0);
