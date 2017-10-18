var env       = require('minimist')(process.argv.slice(2)),
  gulp        = require('gulp'),
  plumber     = require('gulp-plumber'),
  browserSync = require('browser-sync'),
  stylus      = require('gulp-stylus'),
  uglify      = require('gulp-uglify'),
  concat      = require('gulp-concat'),
  jeet        = require('jeet'),
  rupture     = require('rupture'),
  koutoSwiss  = require('kouto-swiss'),
  prefixer    = require('autoprefixer-stylus'),
  imagemin    = require('gulp-imagemin'),
  cleanCSS    = require('gulp-clean-css')
  spawn       = require('child_process').spawn;
    
var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site - executing `bundle exec jekyll build` 
 * Make sure bundle installed in your machine, if not install gem bundle package - 'gem install bundle'
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);  
  var child = spawn('bundle', ['exec', 'jekyll build'], {stdio: 'inherit', detached: true, shell: true});  
  return child.on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-build'], function() {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

/**
 * Stylus task
 */
gulp.task('stylus', function(){
    gulp.src('src/styl/main.styl')
    .pipe(plumber())
    .pipe(stylus({
      use:[koutoSwiss(), prefixer(), jeet(), rupture()],
      compress: true
    }))
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css'));
});
/**
 * Minify css
 */
gulp.task('minify-css', () => {
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css/'));
});
/**
 * Javascript Task
 */
gulp.task('js', function(){
  return gulp.src((env.p) ? 'src/js/**/*.js' : ['src/js/**/*.js', '!src/js/analytics.js'])
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/'));
});

/**
 * Imagemin Task
 */
gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'));
});

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('src/css/**/*.css', ['minify-css']);
  gulp.watch('src/styl/**/*.styl', ['stylus']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch(['**/*.html','index.md', '_includes/*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['js', 'stylus', 'minify-css', 'browser-sync', 'watch']);