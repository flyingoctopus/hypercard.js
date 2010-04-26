/*
 * John Resig's simple class library.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

Block = Class.extend({
	init: function(game, grid, color) {		
		this.color = color;
		this.grid = grid;
		this.game = game;
		this.x = 64;
		this.y = -128;
		this.rotation = 0;
		this.lock = false;
	},
	
	update: function() {
		if (this.lock) {
			return;
		}
		
		var ex = this.x;
		var ey = this.y + 32;
		var erotate = this.rotation;
		if (!this.collide(ex, ey, erotate, true)) {
			this.y += 32;
		}
	},
	
	left: function() {
		if (this.lock) {
			return;
		}
		
		var ex = this.x - 32;
		var ey = this.y;
		var erotate = this.rotation;
		if (!this.collide(ex, ey, erotate, false)) {
			this.x -= 32;
		}
	},
	
	right: function() {
		if (this.lock) {
			return;
		}
		
		var ex = this.x + 32;
		var ey = this.y;
		var erotate = this.rotation;
		if (!this.collide(ex, ey, erotate, false)) {
			this.x += 32;
		}
	},
	
	rotate: function() {
		if (this.lock) {
			return;
		}
		
		var ex = this.x;
		var ey = this.y;
		var erotate = (this.rotation + 1) % 4;
		if (!this.collide(ex, ey, erotate, true)) {
			this.rotation = (this.rotation + 1) % 4;
		}
	},
	
	collide: function(ex, ey, erotate, can_lock) {
		var self = this;
		var y = ey;
		var return_me = false;
		var finish = false;
		$.each(self.grid[erotate], function(k, v) {
			var x = ex;
			$.each(v, function(k2, v2) {
				if (v2) {
					var cx = x / 32;
					var cy = y / 32;
					
					if (cx >= 0 && cy >= 0) {		
						if (cx < self.game.max_x && cy < self.game.max_y) {
					
							if (self.game.grid[cy][cx]) {
								if (cx > 0 && cx < 11) {
									finish =true;
								}
								
								return_me = true;
							}
						
						}
					}
				}

				x += 32;
			});

			y += 32;
		});
		
		if (finish && can_lock) {
			this.lock = true;
			this.copy();
		}
		
		return return_me;
	},
	
	copy: function() {
		var self = this;
		var y = self.y;
		$.each(self.grid[self.rotation], function(k, v) {
			var x = self.x;
			$.each(v, function(k2, v2) {
				if (v2) {
					var cx = x / 32;
					var cy = y / 32;
					
					if (cx >= 0 && cy >= 0) {		
						if (cx < self.game.max_x && cy < self.game.max_y) {
							self.game.grid[cy][cx] = 1;
							square = new Square(self.game, cx, cy, self.color);
							self.game.squares.push(square);
						}
					}
				}

				x += 32;
			});

			y += 32;
		});
		
		this.game.drop();	
	},
	
	render: function() {
		var self = this;
		var y = self.y;
		$.each(self.grid[self.rotation], function(k, v) {
			var x = self.x;
			$.each(v, function(k2, v2) {
				if (v2) {
					self.game.context.fillStyle = self.color;
					self.game.context.fillRect (x, y, 32, 32);	
				}

				x += 32;
			});

			y += 32;
		});
	}
});

Square = Class.extend({
	init: function(game, x, y, color) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.color = color;
		this.display = true;
	},
	
	get_x: function() {
		return this.x;
	},
	
	get_y: function() {
		return this.y;
	},
	
	set_y: function(y) {
		this.y = y;
	},
	
	no_show: function() {
		this.display = false;
	},
	
	down: function() {
		
	},
	
	render: function() {
		if (this.display) {
			this.game.context.fillStyle = this.color;
			this.game.context.fillRect (this.x * 32, this.y * 32, 32, 32);
		}
	}
})

Game = Class.extend({
	init_grid: function() {
		// 12 x 18
		this.max_x = 12;
		this.max_y = 18;
		this.grid = [
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1 , 1, 1]
		] 
	},
	
	generate_blocks: function() {
		var self = this;
		var square_block = new Block(self, 
			[
				[
					[1, 1],
					[1, 1]
				],
				[
					[1, 1],
					[1, 1]
				],
				[
					[1, 1],
					[1, 1]
				],
				[
					[1, 1],
					[1, 1]
				]
			],
			"rgba(255, 125, 0, 0.8)"
			);
			


			
		var straight_block = new Block(self, 
			[
				[
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 1, 1, 1, 1]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 1, 1, 1, 1]
				]
			],
				"rgba(255, 255, 0, 0.8)"
			);
			
			var l1_block = new Block(self, 
				[
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 1, 1],
						[0, 0, 0, 1, 0],
						[0, 0, 0, 1, 0],
						[0, 0, 0, 0, 0]
					],
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 1, 1, 1, 0],
						[0, 0, 0, 1, 0]
					],
					[
						[0, 0, 0, 0, 0],
						[0, 1, 0, 0, 0],
						[0, 1, 0, 0, 0],
						[1, 1, 0, 0, 0],
						[0, 0, 0, 0, 0]
					],
					[
						[0, 1, 0, 0, 0],
						[0, 1, 1, 1, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0]
					]
				],
					"rgba(50, 126, 32, 0.8)"
				);

		
		var l2_block = new Block(self, 
			[
				[
					[0, 0, 0, 0, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 0, 1, 0],
					[0, 0, 0, 1, 0],
					[0, 0, 0, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 1, 0],
					[0, 1, 1, 1, 0],
					[0, 0, 0, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 1, 0, 0, 0],
					[0, 1, 0, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 0, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 1, 1, 1, 0],
					[0, 1, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				]
			],
				"rgba(0, 255, 0, 0.8)"
			);
			
		var crazy_block = new Block(self,
			[
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 1, 1, 1, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 1, 1, 1, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 1, 0, 0]
				],
			],
				"rgba(255, 0, 0, 0.8)"
			);
			
		var crazy_block2 = new Block(self,
			[
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 1, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 1, 1, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 1, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 1, 0, 0]
				],
				[
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 1, 1, 0]
				],
			],
				"rgba(0, 255, 255, 0.8)"
			);
			
			var crazy_block3 = new Block(self,
				[
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 1, 0, 0],
						[0, 0, 1, 1, 0],
						[0, 0, 0, 1, 0]
					],
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 1, 1, 0],
						[0, 1, 1, 0, 0]
					],
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 1, 0, 0],
						[0, 0, 1, 1, 0],
						[0, 0, 0, 1, 0]
					],
					[
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 1, 1, 0],
						[0, 1, 1, 0, 0]
					],
				],
					"rgba(255, 125, 16, 0.8)"
				);
		
		this.blocks = [
			l1_block,
			l2_block,
			square_block,
			straight_block,
			crazy_block,
			crazy_block2,
			crazy_block3
		];
	},
	
	init: function() {
		
		// Get the context of the 2D canvas for rendering.
		var screen = document.getElementById('screen');
		this.context = screen.getContext('2d');
		var self = this;
		
		this.init_grid();
		this.speed = 6;
		this.squares = [];
		this.score = 0;
		this.generate_blocks();
		this.current_block = this.blocks[Number(Math.random() * (this.blocks.length - 0.5)).toFixed(0)];
		this.line_count = 0;
		this.increment = 0;
		
		setInterval(function() {
			// 10 x 17 rows.
			self.context.fillStyle = "rgba(0, 0, 0, 1.0)";
			self.context.fillRect (0, 0, 384, 576);
			
			self.context.fillStyle = "rgba(100, 100, 100, 0.75)";
			self.context.fillRect (0, 0, 32, 576);
			self.context.fillRect (384 - 32, 0, 32, 576);
			self.context.fillRect (32, 576 - 32, 384 - 64, 32);
			
			
			// Allow the speed to change.
			if (self.increment % self.speed == 0) {
				self.current_block.update();
			}
			
			$.each(self.squares, function(k, v) {
				v.render();
			});
			
			self.current_block.render();
			self.increment++;
		}, 50);
		
		$(document).keydown( function(e) {
			if (e.keyCode == 37) {
				self.current_block.left();
			}
			
			if (e.keyCode == 39) {
				self.current_block.right();
			}
			
			if (e.keyCode == 38) {
				self.current_block.rotate();
			}
			
			if (e.keyCode == 40) {
				self.current_block.update();
			}
		});	
	},
	
	check_lines: function() {
		var self = this;
		var lines = [];
		var y = 0;
		$.each(self.grid, function(k, v) {
			var sum = 0;
			
			if (y != 17) {
				$.each(v, function(k2, v2) {
					if (v2) {
						sum += 1;
					}
				});
			}
			if (sum == 12) {
				lines.push(y);
			}
			y++;
		});
		
		var add_score = 1;
		$.each(lines, function(k, v) {
			self.remove_line(v);
			self.line_count++;
			$('.lines').html("Lines: " + self.line_count);
			
			if (self.line_count % 10 == 0) {
				self.speed--;
				if (self.speed < 1) {
					self.spedd = 1;
				}
			}
			
			add_score *= 10;
		});
		

		if (lines.length) {
			self.score = self.score + add_score;
			$('.score').html("Score: " + self.score);
			this.check_lines();
		}
	},
	
	remove_line: function(line_num) {
		var self = this;
		var temp = [1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1];
		this.grid[line_num] = temp;
				
		$.each(self.squares, function(k, v) {
			if (v.get_y() == line_num) {
				v.no_show();
			} else
			
			if (v.get_y() < line_num) {
				v.set_y(v.get_y() + 1)
			}
		});
		
		var temp_grid = [
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 0, 0, 0, 0, 0 ,0 ,0, 0 ,0 , 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1 , 1, 1]
		];
		
		var y = 0;
		$.each(self.grid, function(k, v) {
			var x = 0;
			$.each(v, function(k2, v2) {
				if (y < line_num) {
					if (self.grid[y][x]) {
						temp_grid[y+1][x] = 1;
					} else if (self.grid[y][x]) {
						temp_grid[y][x] = self.grid[y][x];
					}
				} else {
					if (self.grid[y][x]) {
						temp_grid[y][x] = self.grid[y][x];
					}
				}
				
				x++;
			});
			y++;
		});
		
		self.grid = temp_grid;
	},
	
	check_lose: function() {
		var self = this;
		var sum = 0;
		$.each(self.grid[0], function(k, v) {
			
			if (v) {
				sum ++;
			}
		});
		
		if (sum > 2) {
			self.lose = true;
			$('.lose').html("YOU LOSE<br />AND<br />THEREFORE<br />SUCK!")
		}
	},
	
	drop: function() {
		if (!this.lose) {
			this.check_lose();
			this.generate_blocks();
			this.current_block = this.blocks[Number(Math.random() * (this.blocks.length - 0.5)).toFixed(0)];
			this.check_lines();
		}
	}
})

// Load the tetris game.

// Main application entry point.
$(document).ready(function() {
	var game = new Game;
});