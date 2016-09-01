title: Vim拾遗
date: 2016-07-10 14:30:07
tags: [vim]
---
作为一个多年的新手用户，最近终于下定决心要学一下vim的使用方法，于是向@vac聚聚索要了一些学习资料，然后圆润的滚去看文档了。
<!--more-->

在这里记录下一下笔记，包括但不限于*插件*，*vimscript*，*按键组合*等

*ps.由于我用的是neovim，如果出现某些插件或配置与vim不兼容请在评论中指出*

## [dein.vim](https://github.com/Shougo/dein.vim/tree/master/doc "")
和vundle，neobundle一样是管理插件的插件，由neobundle的作者开发并且官方已停止neobundle的功能性更新。
```
set runtimepath^=C:/ProTools/vimplugins/repos/github.com/Shougo/dein.vim

call dein#begin(expand('C:/ProTools/vimplugins'))

call dein#add('Shougo/dein.vim')
call dein#add('Shougo/neosnippet.vim')
call dein#add('Shougo/neosnippet-snippets')
" call dein#add('Valloric/YouCompleteMe')
call dein#add('vim-airline/vim-airline')
call dein#add('vim-airline/vim-airline-themes')
call dein#add('tomasr/molokai')
call dein#add('scrooloose/nerdtree')
call dein#add('Shougo/vimshell')

filetype plugin indent on

if dein#check_install()
    call dein#install()
endif

call dein#end()
```
支持lazy加载，但是由于我的插件较少所以没有使用

## [deoplete](https://github.com/Shougo/deoplete.nvim "")
补全引擎 ~~，和neocomplete作用类似~~

支持第三方扩展以达到支持基于语义的补全。


### clang_compelte
基于`clang`

### deoplete-d
基于`dcd`

## youcompleteme
补全插件，支持c/c++，python，c#，js，ts，rust和go，需要编译才能使用。

- 对c/c++的语义补全基于clang，强于其他插件，但是需要额外的.ycm\_extra_conf文件因此显得很繁琐。
- 对python的补全基于jedi。
- 对c#的补全基于onmisharp。
- 对js和ts的补全基于ternjs而不是tsd，所以实际使用上效果并不理想。
- go和rust没用过

*youcompleteme是一个c/s架构的插件，后端独立为`ycmd`，可以给其他编辑器提供补全。官网已列出的支持ycmd的编辑器有vim，emacs，sublime和atom*

*在WSL中编译YCM失败*

## airline
扩展的状态栏

## nerdtree
项目管理

## monokai
主题，不解释

## vimrc基本设置
```
set expandtab
set tabstop=2
set shiftwidth=2
set ruler
set showmode
set nu
set bg=dark
set autoindent
set autochdir
set hidden
set hlsearch
set incsearch
set showcmd
set backspace=indent,eol,start
hi Search guibg=Yellow guifg=Black ctermbg=Yellow ctermfg=Black
set cursorline
set statusline=%m%F%r%h%w:%l:%c\ [%p%%]
set laststatus=2
set vb t_vb=
set showmatch
set list
set listchars=tab:>-,trail:-
%retab!

set encoding=UTF-8
set fileencodings=utf-8,ucs-bom,cp936,gb18030,big5,euc-jp,euc-kr,latin1
```
vimscript真丑