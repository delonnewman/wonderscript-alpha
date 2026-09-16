; -*- mode: clojure -*-

;; Instantiation

(def a-date (new js/Date 2025 1 2))

;; Message Passing

(is (identical? 2025 (send a-date :js/getFullYear)))
(is (identical? 1 (send a-date :js/getMonth)))
(is (identical? 2 (send a-date :js/getDate)))

(send a-date [:js/setYear 2020]) ;; let's go back in time
(send a-date [:js/setMonth 5])
(is (identical? 2020 (send a-date :js/getFullYear)))
(is (identical? 5 (send a-date :js/getMonth)))

;; Slot Access

(def an-object (send js/Object [:js/create nil]))
(slot-set! an-object :a 1)
(slot-set! an-object :b 2)
(slot-set! an-object :c (js-object "d" 3 "e" 4))

(is (identical? 2 (send an-object :js.prop/b)))
(is (identical? 1 (send an-object :js.prop/a)))
(is (identical? 3 (send an-object [:js/dig :c :d])))
(is (identical? 4 (send an-object [:js/dig :c :e])))

(is (nil? (send an-object :js.prop/d)))
(slot-set! an-object :c 3)
(is (identical? 3 (send an-object :js.prop/c)))

(is (send an-object [:respond-to? :a]))
(is (not (send an-object [:respond-to? :d])))
