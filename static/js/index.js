//$(function(){
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState=='hidden'){
      normal_title=document.title
      document.title='(づ￣ 3￣)づ'
    }else{
      document.title=normal_title
      location.reload()
    }
  })

  const show_loader=(l_obj,l_text='Loading')=>{
    if(l_obj.find('.my_loader').length==0){
        l_obj.append('<div class="ui dimmer active my_loader"><div class="ui text loader" style="font-size: 2rem;">'+l_text+'</div></div>')
    }
    if(!l_obj.find('.my_loader').dimmer('is active')){
        l_obj.find('.my_loader').dimmer({closable:false}).dimmer('show')
    }
  }
  const hide_loader=(l_obj)=>{
    l_obj.find('.my_loader').fadeOut('fast',function(){
      $(this).remove()
    })
  }
  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++
      }
      return size
  }

let index = {
    tiny_modal: null,
    large_modal: null,
    fullscreen_scrolling_modal: null,
    key: undefined,
    bg_images: ['prius_1.png', 'prius_2.png','prius_3.png'],
    modal_init: (modal_type, callback, res) => {
        index.tiny_modal = $('<div class="ui tiny modal tiny_modal"><div class="header" style="font-size: 1.6rem;">系 統 訊 息[System Information]</div><div class="content"></div></div>')
        index.large_modal = $('<div class="ui large modal large_modal"><div class="header" style="font-size: 1.6rem;">系 統 訊 息[System Information]</div><div class="scrolling content" style="max-height: calc(80vh)!important;"></div></div>')
        index.fullscreen_scrolling_modal = $('<div class="ui large modal fullscreen_scrolling_modal"></div>')
        $('.' + modal_type + '.modal').remove()
        $('body').append(eval('index.' + modal_type))
        //(callback && typeof(callback) === "function") && callback(res)
        if (callback && typeof (callback) === "function") {
            callback(res)
        }
    },
    encryptString:(text)=>{
        const key = CryptoJS.enc.Utf8.parse((index.key).substring(0, 16));
        const iv = CryptoJS.enc.Utf8.parse((index.key).substring((index.key).length -16));
        const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
        let res=encrypted.toString()
        return res
    },
    my_toast: (color, msg, ms = 3000,position='top right')=>{
        $.toast({
            title: msg,
            position: position,
            message: '系統訊息',
            class: color,
            opacity: 0.8,
            displayTime: ms,
            showProgress: 'bottom',
            className: {
                toast: 'ui message'
            }
        })
    },
    check_id_input:(emp_id,pass_wd)=>{
        let check_flag=true
        if(emp_id.find('input').val().length==0){
            emp_id.parent('.field').addClass('error').transition('shake')
            index.my_toast('red','請輸入員工編號')
            check_flag=false
        }else{
            emp_id.parent('.field').removeClass('error')
        }
        if(pass_wd.find('input').val().length==0){
            pass_wd.parent('.field').addClass('error').transition('shake')
            index.my_toast('red','請輸入密碼')
            check_flag=false
        }else{
            pass_wd.parent('.field').removeClass('error')
        }
        return check_flag
    },
    show_punch_rec:async(emp_id,pass_wd,this_btn)=>{
        let emp_id_val=index.encryptString(emp_id.find('input').val())
        let pass_wd_val=index.encryptString(pass_wd.find('input').val())
        this_btn.addClass('disabled')
        show_loader($('body'))
        try {
            let punch_rec_html=await $.post('/get_punch_rec', { "emp_id_val": emp_id_val, "pass_wd_val": pass_wd_val})
            hide_loader($('body'))
            this_btn.removeClass('disabled')
            let show_large_modal=async()=>{
              $('.large_modal.modal').find('.content').html(punch_rec_html)
              $('.large_modal.modal table').tablesort()
              $('.large_modal.modal').modal({
                onHide:function(){
                  location.reload()
                }
              }).modal('show')
            }
            index.modal_init('large_modal',show_large_modal)
        }
        catch(err) {
            hide_loader($('body'))
            index.my_toast('red', '編號或密碼錯誤',10000)
            emp_id.parent('.field').addClass('error').transition('shake')
            pass_wd.parent('.field').addClass('error').transition('shake')
        }
    },
    punch: async (emp_id,pass_wd,sign_kind,this_btn)=>{
        this_btn.addClass('disabled')
        let emp_id_val=index.encryptString(emp_id.find('input').val())
        let pass_wd_val=index.encryptString(pass_wd.find('input').val())
        let en_sign_kind=index.encryptString(sign_kind)
        let res = await $.post('/do_punch', { "emp_id_val": emp_id_val, "pass_wd_val": pass_wd_val,"sign_kind":en_sign_kind })
        switch(res.status){
            case'error':
                index.my_toast('red', res.msg,10000)
                emp_id.parent('.field').addClass('error').transition('shake')
                pass_wd.parent('.field').addClass('error').transition('shake')
            break
            case'ok':
                index.my_toast('blue', res.msg,20000)
                emp_id.find('input').val('')
                pass_wd.find('input').val('')
            break
            case'late_in':
            case'early_out':
                index.my_toast('yellow', res.msg,20000)
                emp_id.find('input').val('')
                pass_wd.find('input').val('')
            break
            case'early_in':
            case'late_out':
                let upd_remark_modal=await $.post('/get_upd_remark_modal', { "msg": res.msg,'sign_kind':sign_kind })
                let show_tiny_modal=()=>{
                  $('.tiny_modal.modal').find('.content').append(upd_remark_modal)
                  $('.tiny_modal .remark.dropdown').dropdown()
                  $('.tiny_modal .upd_remark.button').click(async()=>{
                    let remark=$('.tiny_modal .remark.dropdown').dropdown('get value')
                    if(remark.length==0){
                        $('.remark.dropdown').addClass('error').transition('shake')
                    }else{
                        $('.tiny_modal .upd_remark.button').addClass('disabled')
                        let status=res.status
                        status=index.encryptString(status)
                        remark=index.encryptString(remark)
                        let res_2 = await $.post('/do_punch_2', { "emp_id_val": emp_id_val, "pass_wd_val": pass_wd_val,"sign_kind":en_sign_kind,"status":status,"remark":remark})
                        $('.tiny_modal .upd_remark.button').removeClass('disabled')
                        $('.tiny_modal.modal>.content').html('<div class="ui icon message"><i class="comment dots outline icon"></i><div class="content"><div class="header">'+res_2.msg+'</div></div></div><div style="text-align: center;margin-top: 1rem;"><button class="ui basic red button">關 閉</button></div>')
                        $('.tiny_modal .red.button').click(function(){
                            $('.tiny_modal.modal').modal('hide')
                        })
                    }
                  })
                  $('.tiny_modal .right.red.button').click(function(){
                    $('.tiny_modal.modal').modal('hide')
                  })
                  $('.tiny_modal.modal').modal({
                    closable:false,
                    onHide:function(){
                      location.reload()
                    }
                  }).modal('show')
                }
                index.modal_init('tiny_modal',show_tiny_modal)
            break

        }
        this_btn.removeClass('disabled')
    },
    show_admin:async(emp_id,pass_wd,this_btn)=>{
        let emp_id_val=index.encryptString(emp_id.find('input').val())
        let pass_wd_val=index.encryptString(pass_wd.find('input').val())
        this_btn.addClass('disabled')
        show_loader($('body'))
        try {
            let admin_page_html=await $.post('/get_admin_page', { "emp_id_val": emp_id_val, "pass_wd_val": pass_wd_val})
            hide_loader($('body'))
            this_btn.removeClass('disabled')
            $('#clock').transition('fly down')
            $('.sign.segment').transition('fly up',function(){
                $('.admin.segment').html(admin_page_html).transition('zoom')
                $('.admin.segment .menu .item').tab()
                $('.p_com.dropdown,.s_com.dropdown').dropdown({
                    onChange:function(value, text, $selectedItem){
                        let d_parent=value
                        let this_dropdown=$(this)
                        let dep_dropdown=this_dropdown.parent().next().find('.dropdown');
                        (async () => {
                            let dep_dropdown_html=await $.get('/get_dep', { "d_parent": d_parent})
                            dep_dropdown.find('.menu').html(dep_dropdown_html)
                            dep_dropdown.dropdown('restore defaults','refresh')
                        })()
                    }
                })
                $('.p_dep.dropdown,.s_dep.dropdown').dropdown()
                $('.p_start_date>.calendar').calendar({
                  type: 'date',
                  formatter: {
                        date: 'YYYY-MM-DD'
                  },
                  endCalendar: $('.p_end_date>.calendar')
                })
                $('.p_end_date>.calendar').calendar({
                  type: 'date',
                  formatter: {
                        date: 'YYYY-MM-DD'
                  },
                  startCalendar: $('.p_start_date>.calendar')
                })
                $('.s_start_date>.calendar').calendar({
                  type: 'date',
                  formatter: {
                        date: 'YYYY-MM-DD'
                  },
                  endCalendar: $('.s_end_date>.calendar')
                })
                $('.s_end_date>.calendar').calendar({
                  type: 'date',
                  formatter: {
                        date: 'YYYY-MM-DD'
                  },
                  startCalendar: $('.s_start_date>.calendar')
                })
                $('.item.p_search').click(async()=>{
                    let this_btn=$('.item.p_search')
                    let target_div=$('.p_search_res')
                    let check_flag=true
                    this_btn.addClass('disabled')
                    let p_com=$('.p_com.dropdown').dropdown('get value')
                    let p_dep=$('.p_dep.dropdown').dropdown('get value')
                    let start_date = $('.p_start_date>.calendar input').val()
                    let end_date = $('.p_end_date>.calendar input').val()
                    if(p_com.length==0 && p_dep.length==0 && start_date.length==0 && end_date.length==0){
                        $('.punch_record>.grid').transition('bounce').find('.field').addClass('error')
                        index.my_toast('red','請至少輸入一項條件',6000,'top left')
                    }else{
                        $('.punch_record>.grid').find('.field').removeClass('error')
                        show_loader($('.active.tab'))
                        try {
                            let res_p_search = await $.get('/get_punch_search', { "p_com": p_com,"p_dep": p_dep,"start_date": start_date,"end_date": end_date})
                            target_div.html(res_p_search).transition('jiggle')
                            $('.table.punch_search_res').DataTable({
                                "order": [[ 4, "desc" ]],
                                scrollY: '60vh',
                                scrollCollapse: true,
                                paging: false,
                                language: {
                                    searchPlaceholder: "關鍵字搜尋",
                                    emptyTable:"尚 無 資 料"
                                },
                                "initComplete": function(){
                                    $('.table.punch_search_res .my_popup').popup()
                                    $('.table.punch_search_res tr').click(function(){alert(1)})
                                  }
                            });
                        }
                        catch(err) {
                            index.my_toast('red', 'ERROR',10000)
                        }
                        hide_loader($('.active.tab'))
                    }
                    this_btn.removeClass('disabled')

                })
                $('.button.s_search').click()
            })
        }
        catch(err) {
            hide_loader($('body'))
            index.my_toast('red', '編號或密碼錯誤',10000)
            emp_id.parent('.field').addClass('error').transition('shake')
            pass_wd.parent('.field').addClass('error').transition('shake')
        }
    },
    init: async ()=>{
        index.key = $('#key').val()
        $('.emp_id>input,.pass_wd>input').focus(function(){
            $(this).select()
        })
        $('.button.sign_in,.button.sign_out').click(function(){
            let emp_id=$('.input.emp_id')
            let pass_wd=$('.input.pass_wd')
            if(index.check_id_input(emp_id,pass_wd)){
                let sign_kind
                let this_btn=$(this)
                if(this_btn.hasClass('sign_in')){
                    sign_kind='in'
                }else if(this_btn.hasClass('sign_out')){
                    sign_kind='out'
                }
                index.punch(emp_id,pass_wd,sign_kind,this_btn)
            }
        })
        $('.button.punch_rec').click(()=>{
            let emp_id=$('.input.emp_id')
            let pass_wd=$('.input.pass_wd')
            let this_btn=$(this)
            if(index.check_id_input(emp_id,pass_wd)){
                index.show_punch_rec(emp_id,pass_wd,this_btn)
            }
        })
        $('.button.admin').click(async()=>{
            let emp_id=$('.input.emp_id')
            let pass_wd=$('.input.pass_wd')
            let this_btn=$(this)
            if(index.check_id_input(emp_id,pass_wd)){
                index.show_admin(emp_id,pass_wd,this_btn)
            }
        })
//        $('.admin.segment').click(async()=>{
//            if($('#clock').hasClass('hidden')){
//                $('.admin.segment').transition('zoom',function(){
//                    $('#clock').transition('fly down')
//                    $('.sign.segment').transition('fly up')
//                })
//            }
//        })
    }
}

  index.init()
//})