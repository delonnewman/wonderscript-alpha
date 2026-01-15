; -*- mode: clojure -*-

;; Truth & Falsehood

(is (identical? 2 (if false 1 2)))
(is (identical? 2 (if nil 1 2)))
(is (identical? 1 (if true 1 2)))
;; (is (identical? 1 (if 0 1 2)))
(is (identical? 1 (if '() 1 2)))
(is (identical? 1 (if {} 1 2)))
(is (identical? 1 (if [] 1 2)))
;; (is (identical? 1 (if "" 1 2)))
(is (identical? 1 (if #{} 1 2)))
