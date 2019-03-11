const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const watch = require('gulp-watch');
const replace = require('gulp-replace');
const preprocess = require('gulp-preprocess');
const Bundler = require('parcel-bundler');
const Path = require('path');


async function bundleBuild(fileName) {
  let file = Path.join(__dirname, `./${fileName}`);
  let options = {
    outDir: './dist', // 将生成的文件放入输出目录下，默认为 dist
    outFile: fileName, // 输出文件的名称
    publicUrl: './', // 静态资源的 url ，默认为 dist
    watch: false, // 是否需要监听文件并在发生改变时重新编译它们，默认为 process.env.NODE_ENV !== 'production'
    cache: true, // 启用或禁用缓存，默认为 true
    cacheDir: '.cache', // 存放缓存的目录，默认为 .cache
    minify: (process.env.NODE_ENV === 'production'), // 压缩文件，当 时，会启用
    target: 'browser', // 浏览器/node/electron, 默认为 browser
    https: false, // 服务器文件使用 https 或者 http，默认为 false
    logLevel: (process.env.NODE_ENV === 'production') ? 1 : 3, // 3 = 输出所有内容，2 = 输出警告和错误, 1 = 输出错误
    sourceMaps: (process.env.NODE_ENV != 'production'),
    hmrHostname: '', // 热模块重载的主机名，默认为 ''
    detailedReport: true // 打印 bundles、资源、文件大小和使用时间的详细报告，默认为 false，只有在禁用监听状态时才打印报告
  };
  let bundler = new Bundler(file, options);
  await bundler.bundle();
}


gulp.task('watch', function () {
  // watch many files
  watch([
    'manifest.json', '*.html',
    'static/*.js', 'static/style/*.css'
  ], function () {
    gulp.start('default');
  });
});

gulp.task('pack-contentjs', function () {
  return gulp.src([
    'node_modules/weui.js/dist/weui.min.js',
    'static/content_script.js'
  ])
  .pipe(concat('content_script.js'))
  .pipe(gulp.dest('build/static'));
});

gulp.task('pack-content_style', function () {
  return gulp.src(['static/style/weui.min.css', 'static/style/style.css'])
    .pipe(concat('content_style.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest('build/static/style'));
});

gulp.task('pack-popup_style', function () {
  return gulp.src([
    'static/style/weui.min.css',
    'node_modules/tippy.js/dist/tippy.css',
    'static/style/popup.css'
  ])
  .pipe(concat('popupstyle.css'))
  .pipe(cleanCss())
  .pipe(gulp.dest('build/static/style'));
});


gulp.task('move-static', ['build-bundle'], function () {
  gulp.src([
    'static/audio/*.*', 'static/image/*.*', 'static/image/*/*.*', 'static/style/*.css'
  ], { base: './' })
    .pipe(gulp.dest('build'));
});

gulp.task('move-js', [], function () {
  gulp.src([
    'static/start.js',
    'static/mobile_script.js',
    'node_modules/zepto/dist/zepto.min.js',
    'node_modules/@sunoj/touchemulator/touch-emulator.js',
  ])
  .pipe(gulp.dest('build/static'));
});

gulp.task('move-file', [], async function () {
  let browser = (process.env.BROWSER ? process.env.BROWSER : 'chrome')
  await new Promise((resolve, reject) => {
    gulp.src([
      'manifest.json', '*.html'
    ])
    .pipe(replace('{{version}}', process.env.VERSION))
    .pipe(replace('{{buildid}}', process.env.BUILDID))
    .pipe(replace('{{browser}}', browser))
    .pipe(preprocess({
      context: {
        Browser: browser
      }
    }))
    .pipe(gulp.dest('build'))
    .on("end", resolve);
  });
  console.log('move-file done')
});


gulp.task('build-bundle', ['move-file'], async function () {
  console.log('build-bundle start')
  await bundleBuild('static/background.js')
  await bundleBuild('static/popup.js')
  console.log('build-bundle done')
});

gulp.task('move-build-bundle', ['build-bundle'], async function () {
  console.log('move-build-bundle start')
  let browser = (process.env.BROWSER ? process.env.BROWSER : 'chrome')
  await new Promise((resolve, reject) => {
    gulp.src([
      'dist/*.js'
    ])
    .pipe(replace('{{version}}', process.env.VERSION))
    .pipe(replace('{{buildid}}', process.env.BUILDID))
    .pipe(replace('{{browser}}', browser))
    .pipe(preprocess({
      context: {
        Browser: browser
      }
    }))
    .pipe(gulp.dest('build/static'))
    .on("end", resolve);
  });
  console.log('move-build-bundle done')
});


gulp.task('default', [
  'move-file', 'move-js', 'pack-content_style', 'pack-popup_style',
  'pack-contentjs', 'build-bundle', 'move-build-bundle', 'move-static'
]);

gulp.task('dev', ['default', 'watch']);